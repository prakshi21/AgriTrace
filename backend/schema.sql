DROP DATABASE IF EXISTS seed;
CREATE DATABASE IF NOT EXISTS seed;
USE seed;

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('Producer', 'QualityLab', 'WarehouseManager', 'Distributor', 'Transporter', 'Farmer', 'Admin') NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Current owner/holder
    batch_id VARCHAR(100) NOT NULL UNIQUE,
    quantity DECIMAL(10, 2) NOT NULL,
    crop_details VARCHAR(255) NOT NULL,
    
    -- Extended Tracking Details
    producer_id INT,
    lab_id INT,
    transporter_id INT,
    warehouse_id INT,
    
    date_of_production DATE,
    date_of_expiry DATE,
    date_of_delivery DATE,
    
    quality_grade VARCHAR(50),
    pdf_hash VARCHAR(255),
    status ENUM('Created', 'Sent to Lab', 'Received by Lab', 'Certified', 'Rejected', 'In Transport', 'Awaiting Warehouse Receipt', 'With Warehouse', 'Sold to Farmer', 'Expired') NOT NULL,
    location VARCHAR(255) DEFAULT 'Unknown',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (producer_id) REFERENCES Users(id),
    FOREIGN KEY (lab_id) REFERENCES Users(id),
    FOREIGN KEY (transporter_id) REFERENCES Users(id),
    FOREIGN KEY (warehouse_id) REFERENCES Users(id)
);

-- Insert dummy users for testing
INSERT INTO Users (role, name, email, password_hash) VALUES 
('Producer', 'John Producer', 'producer@test.com', '$2b$10$abcdefghijklmnopqrstuv'),
('QualityLab', 'Alpha Quality Lab', 'lab@test.com', '$2b$10$abcdefghijklmnopqrstuv'),
('Transporter', 'Express Logistics', 'transporter@test.com', '$2b$10$abcdefghijklmnopqrstuv'),
('WarehouseManager', 'Central Warehouse', 'warehouse@test.com', '$2b$10$abcdefghijklmnopqrstuv'),
('Admin', 'System Administrator', 'admin@test.com', '$2b$10$abcdefghijklmnopqrstuv');


CREATE TABLE IF NOT EXISTS Transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(100) NOT NULL,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Completed', 'Rejected') DEFAULT 'Pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES Users(id),
    FOREIGN KEY (to_user_id) REFERENCES Users(id)
);

-- Seed some initial users for testing
INSERT IGNORE INTO Users (id, role, name, email, password_hash) VALUES 
(1, 'Producer', 'AgriSeed Co.', 'producer@test.com', '$2b$10$abcdefghijklmnopqrstuv'),
(2, 'QualityLab', 'National Seed Lab', 'lab@test.com', '$2b$10$abcdefghijklmnopqrstuv'),
(3, 'WarehouseManager', 'Central Warehouse', 'warehouse@test.com', '$2b$10$abcdefghijklmnopqrstuv'),
(4, 'Distributor', 'Regional Distributor', 'distributor@test.com', '$2b$10$abcdefghijklmnopqrstuv'),
(5, 'Admin', 'Gov Admin', 'admin@test.com', '$2b$10$abcdefghijklmnopqrstuv'),
(6, 'Transporter', 'FastTrack Logistics', 'transporter@test.com', '$2b$10$abcdefghijklmnopqrstuv');
