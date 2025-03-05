package ec.edu.espe.websocketsserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WebsocketsserverApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebsocketsserverApplication.class, args);
	}

}
