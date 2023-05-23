package streamcatcher

//keeping for learnign purposes, this file is not used anymore

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"microsomes.com/stgo/utils"
)

type StreamCatcherSocketServer struct {
	conns            map[*websocket.Conn]bool
	readTimeout      time.Duration
	writeTimeout     time.Duration
	pongTimeout      time.Duration
	maxMessageSize   int64
	closeGracePeriod time.Duration
}

func NewStreamCatcherSocketServer() *StreamCatcherSocketServer {
	return &StreamCatcherSocketServer{
		conns:            make(map[*websocket.Conn]bool),
		readTimeout:      10 * time.Second,
		writeTimeout:     10 * time.Second,
		pongTimeout:      60 * time.Second,
		maxMessageSize:   1024 * 1024,
		closeGracePeriod: 10 * time.Second,
	}
}

func (s *StreamCatcherSocketServer) BroadcastEvents(event utils.JobEvent) {
	for conn := range s.conns {
		bytes, _ := json.Marshal(event)
		conn.WriteMessage(websocket.TextMessage, bytes)
	}
}

func (s *StreamCatcherSocketServer) handleWs(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Got a websocket connection", r.RemoteAddr)
	conn, err := websocket.Upgrade(w, r, nil, 1024, 1024)
	if err != nil {
		fmt.Println("Failed to upgrade websocket connection:", err)
		return
	}
	conn.SetReadLimit(s.maxMessageSize)
	conn.SetReadDeadline(time.Now().Add(s.readTimeout))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(s.readTimeout))
		return nil
	})
	s.conns[conn] = true
	s.readLoop(conn)
}

func (s *StreamCatcherSocketServer) readLoop(conn *websocket.Conn) {
	defer func() {
		conn.Close()
		delete(s.conns, conn)
	}()

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				fmt.Println("Error reading from websocket:", err)
			}
			break
		}
		fmt.Println("Read from websocket:", string(message))
		conn.SetReadDeadline(time.Now().Add(s.readTimeout))
		conn.WriteMessage(messageType, []byte("thanks for message"))
	}
}

func (s *StreamCatcherSocketServer) StartSocketServer(ctx context.Context) {
	http.HandleFunc("/ws", s.handleWs)
	server := &http.Server{
		Addr:         ":9006",
		ReadTimeout:  s.readTimeout + s.pongTimeout,
		WriteTimeout: s.writeTimeout,
	}

	go func() {
		<-ctx.Done()
		fmt.Println("Closing all websocket connections")
		for conn := range s.conns {
			conn.SetWriteDeadline(time.Now().Add(s.closeGracePeriod))
			conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			conn.Close()
			delete(s.conns, conn)
		}
		server.Shutdown(context.Background())
	}()

	err := server.ListenAndServe()
	if err != nil {
		fmt.Println("Error starting websocket server:", err)
	}
}
