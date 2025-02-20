use axum::{
    extract::{ws::{Message,WebSocket, WebSocketUpgrade}, Query},
    response::IntoResponse,
    routing::get,
    Json, Router,
};
// use tokio::sync::broadcast;
use std::{env, net::SocketAddr};
use serde::{Deserialize, Serialize};
use reqwest::Client;
use rand::{Rng, SeedableRng};
use rand::rngs::SmallRng;
use tokio::time::{sleep, Duration};
use dotenv::dotenv;

#[derive(Deserialize)]
struct AQIRequest {
    city: String,
    state: String,
    country: String,
}

#[derive(Serialize, Deserialize)]
struct AQIResponse {
    status: String,
    data: Option<AQIResult>,
}

#[derive(Serialize, Deserialize)]
struct AQIResult {
    current: Option<AQIInfo>,
}

#[derive(Serialize, Deserialize)]
struct AQIInfo {
    pollution: AQIData,
}

#[derive(Serialize, Deserialize)]
struct AQIData {
    ts: String,
    aqius: i32,  // AQI value (US Standard)
}

// WebSocket handler
async fn websocket_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(|socket| async move {
        println!("WebSocket client connected!");
        handle_socket(socket).await;
    })
}



async fn handle_socket(mut socket: WebSocket) {
    println!("Client connected to WebSocket");

    let mut rng = SmallRng::from_entropy(); // Use SmallRng instead of thread_rng

    loop {
        let aqi_value = rng.gen_range(50..150); // Generate random AQI between 50-150
        let json_data = format!(r#"{{"aqi": {}, "status": "{}"}}"#, aqi_value, "Updated");

        if socket.send(Message::Text(json_data)).await.is_err() {
            println!("Client disconnected, stopping updates.");
            break;
        }

        println!("Sent AQI update: {}", aqi_value);
        sleep(Duration::from_secs(5)).await; // Send updates every 5 seconds
    }
}




// HTTP Route for AQI
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
                Json(AQIResponse { status: "error".to_string(), data: None })
            }
        }
        Err(_) => Json(AQIResponse { status: "error".to_string(), data: None }),
    }
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let app = Router::new()
        .route("/aqi", get(get_aqi))
        .route("/ws", get(websocket_handler));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
