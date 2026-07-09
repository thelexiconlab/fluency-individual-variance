library(dplyr)
library(readr)

fluency_data <- read_csv("fluency_data.csv")

fluency_forager <- fluency_data %>%
  rename(SID = Subject, entry = corrected_response) %>%
  filter(domain != "12922.7")

fluency_forager %>%
  group_by(domain) %>%
  group_walk(~ write_csv(.x, paste0("forager_", .y$domain, ".csv")))