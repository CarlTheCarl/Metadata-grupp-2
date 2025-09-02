CREATE TABLE IF NOT EXISTS files_metadata (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  filename VARCHAR(512) NOT NULL,
  path TEXT NOT NULL,
  mimeType VARCHAR(255),
  size_bytes BIGINT,
  createdAt DATETIME NULL,
  modifiedAt DATETIME NULL,
  latitude DECIMAL(9,6) NULL,
  longitude DECIMAL(9,6) NULL,
  meta JSON NULL,
  indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexer för snabbare sökningar
CREATE INDEX idx_filename ON files_metadata (filename(191));
CREATE INDEX idx_mime ON files_metadata (mimeType);
CREATE INDEX idx_size ON files_metadata (size_bytes);
CREATE INDEX idx_geo ON files_metadata (latitude, longitude);
