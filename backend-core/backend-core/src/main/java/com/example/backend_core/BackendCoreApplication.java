package com.example.backend_core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceTransactionManagerAutoConfiguration;

@SpringBootApplication
//@SpringBootApplication(exclude = {
//	    DataSourceAutoConfiguration.class, 
//	    DataSourceTransactionManagerAutoConfiguration.class, 
//	    HibernateJpaAutoConfiguration.class
//	})

public class BackendCoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendCoreApplication.class, args);
	}

}
