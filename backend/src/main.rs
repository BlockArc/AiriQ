use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Query,
    },
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use dotenv::dotenv;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::{env, net::SocketAddr};
use tokio::time::{sleep, Duration};

#[derive(Deserialize, Debug)]
struct AQIRequest {
    city: String,
    state: String,
    country: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct AQIResponse {
    status: String,
    data: Option<AQIResult>,
}

#[derive(Serialize, Deserialize, Debug)]
struct AQIResult {
    current: Option<AQIInfo>,
}

#[derive(Serialize, Deserialize, Debug)]
struct AQIInfo {
    pollution: Option<AQIData>,
}

#[derive(Serialize, Deserialize, Debug)]
struct AQIData {
    ts: String,
    aqius: i32, // AQI value (US Standard)
}

// WebSocket handler with dynamic location support
async fn websocket_handler(ws: WebSocketUpgrade, Query(params): Query<AQIRequest>) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, params))
}

async fn handle_socket(mut socket: WebSocket, params: AQIRequest) {
    println!("WebSocket client connected!");

    let api_key = match env::var("API_KEY") {
        Ok(key) => key,
        Err(_) => {
            eprintln!("API key is missing!");
            return;
        }
    };

    let client = Client::new();

    loop {
        let url = format!(
            "http://api.airvisual.com/v2/city?city={}&state={}&country={}&key={}",
            params.city, params.state, params.country, api_key
        );

        match client.get(&url).send().await {
            Ok(response) => {
                if let Ok(aqi_data) = response.json::<AQIResponse>().await {
                    if let Some(data) = aqi_data.data {
                        if let Some(current) = data.current {
                            if let Some(pollution) = current.pollution {
                                let json_data = serde_json::to_string(&pollution).unwrap();
                                
                                if socket.send(Message::Text(json_data)).await.is_err() {
                                    println!("Client disconnected");
                                    break;
                                }
                            } else {
                                println!("No pollution data available.");
                            }
                        } else {
                            println!("No current AQI data available.");
                        }
                    } else {
                        println!("Invalid AQI data format.");
                    }
                } else {
                    println!("Failed to parse AQI API response.");
                }
            }
            Err(err) => {
                eprintln!("Failed to fetch AQI data: {:?}", err);
            }
        }

        sleep(Duration::from_secs(5)).await; // Send updates every 5 seconds
    }
}

// HTTP Route for one-time AQI fetching
async fn get_aqi(Query(params): Query<AQIRequest>) -> Json<AQIResponse> {
    let api_key = env::var("API_KEY").expect("API key not set");
    let url = format!(
        "http://api.airvisual.com/v2/city?city={}&state={}&country={}&key={}",
        params.city, params.state, params.country, api_key
    );

    let client = Client::new();
    let response = client.get(&url).send().await;

    match response {
        Ok(resp) => {
            if let Ok(data) = resp.json::<AQIResponse>().await {
                Json(data)
            } else {
                Json(AQIResponse {
                    status: "error".to_string(),
                    data: None,
                })
            }
        }
        Err(_) => Json(AQIResponse {
            status: "error".to_string(),
            data: None,
        }),
    }
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let app = Router::new()
        .route("/aqi", get(get_aqi))
        .route("/ws", get(websocket_handler)); // WebSocket route

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
