module.exports = {
  port: 8001,
  https_key: './examples/snakeoil.key',
  https_cert: './examples/snakeoil.crt',
  db_name: 'ethersheet',
  db_user: 'ethersheet',
  db_password: 'ethersheet',
  db_host: 'localhost',
  db_type: 'mysql',
  debug: false,
  default_row_count: 10,
  default_col_count: 10,
  expire_days: 0,
  intro_text: "Welcome to SPOD Spreadsheet, enter a sheet name to get started"
}
