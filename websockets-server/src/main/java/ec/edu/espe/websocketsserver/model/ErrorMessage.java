package ec.edu.espe.websocketsserver.model;

import java.util.Date;

public class ErrorMessage {

    private String error;

    private Date date;

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
