run: 
	colima start
	docker-compose -f docker-compose.yml up frontend backend postgresdb

rebuild:
	colima start
	docker-compose -f docker-compose.yml up --build frontend backend postgresdb

backend-only:
	colima start
	docker-compose -f docker-compose.yml up --build backend postgresdb