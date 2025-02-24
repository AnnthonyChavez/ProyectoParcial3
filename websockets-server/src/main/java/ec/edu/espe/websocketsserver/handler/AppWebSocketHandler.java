package ec.edu.espe.websocketsserver.handler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import ec.edu.espe.websocketsserver.model.Player;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

public class AppWebSocketHandler implements WebSocketHandler {

    private static final CopyOnWriteArraySet<WebSocketSession> SESSIONS = new CopyOnWriteArraySet<>();
    private static final Map<String, Player> players = new ConcurrentHashMap<>();
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String username = getUsernameSession(session);

        if (username == null || players.containsKey(username)) {
            session.close();
            return;
        }

        Player newPlayer = new Player(username);
        players.put(username, newPlayer);
        SESSIONS.add(session);

        broadcastPlayersUpdate();
    }

    private String getUsernameSession(WebSocketSession session) {
        return (String) session.getAttributes().get("username"); // Obtener usuario autenticado
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws IOException {
        String username = getUsernameSession(session);
        if (username == null) return;

        Player player = players.get(username);
        if (player == null) return;

        String payload = message.getPayload().toString();
        JsonNode jsonNode = MAPPER.readTree(payload);

        if (jsonNode.has("action")) {
            String action = jsonNode.get("action").asText();

            if ("move".equals(action) && jsonNode.has("x") && jsonNode.has("y")) {
                player.setX(jsonNode.get("x").asInt());
                player.setY(jsonNode.get("y").asInt());
                broadcastPlayersUpdate();
            }

            if ("attack".equals(action)) {
                attackPlayers(player);
                broadcastPlayersUpdate();
            }
        }
    }

    private void attackPlayers(Player attacker) throws IOException {
        for (Player p : players.values()) {
            if (!p.getUsername().equals(attacker.getUsername()) && p.getX() == attacker.getX() && p.getY() == attacker.getY()) {
                p.setHealth(p.getHealth() - 1);
                if (p.getHealth() <= 0) {
                    players.remove(p.getUsername());
                    closePlayerSession(p.getUsername());
                }
            }
        }
    }

    private void closePlayerSession(String username) throws IOException {
        WebSocketSession sessionToClose = null;
        for (WebSocketSession session : SESSIONS) {
            if (getUsernameSession(session).equals(username)) {
                sessionToClose = session;
                break;
            }
        }

        if (sessionToClose != null) {
            sessionToClose.close();
            SESSIONS.remove(sessionToClose);
        }
    }

    private void broadcastPlayersUpdate() throws IOException {
        String updateMessage = MAPPER.writeValueAsString(players.values());

        for (WebSocketSession session : SESSIONS) {
            session.sendMessage(new TextMessage(updateMessage));
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        session.close();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String username = getUsernameSession(session);
        if (username != null) {
            players.remove(username);
        }
        SESSIONS.remove(session);
        broadcastPlayersUpdate();
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
}
