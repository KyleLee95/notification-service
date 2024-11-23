docker run -d -e POSTGRES_DB=notification-service-db \
	-e POSTGRES_PASSWORD=password \
	-e POSTGRES_USER=postgres \
	-p "8081:5432" postgres
