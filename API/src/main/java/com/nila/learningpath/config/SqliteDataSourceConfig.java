package com.nila.learningpath.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class SqliteDataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    DataSource dataSource(DataSourceProperties properties) {
        createDataDirectory(properties.determineUrl());
        return properties.initializeDataSourceBuilder().build();
    }

    private void createDataDirectory(String jdbcUrl) {
        String path = jdbcUrl.replace("jdbc:sqlite:", "");
        if (path.startsWith(":")) return; // :memory: or :resource: — skip
        try {
            Path parent = Path.of(path).getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Cannot create SQLite data directory: " + e.getMessage(), e);
        }
    }
}
