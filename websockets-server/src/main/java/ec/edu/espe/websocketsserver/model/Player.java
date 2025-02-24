package ec.edu.espe.websocketsserver.model;

import java.util.Random;

public class Player {
    private String username;
    private int x;
    private int y;
    private int health;

    public Player(String username) {
        this.username = username;
        this.x = new Random().nextInt(10);
        this.y = new Random().nextInt(10);
        this.health = 3;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public int getHealth() {
        return health;
    }

    public void setHealth(int health) {
        this.health = health;
    }
}
