# Parallel Tasks Execution

## Описание проекта

Данный проект реализует механизм распределённых обработчиков, использующих базу данных для хранения заданий. Каждый обработчик получает из БД URL, выполняет по нему HTTP-запрос и сохраняет результат (HTTP-код ответа) обратно в таблицу. При этом реализована параллельная обработка заданий, а каждый URL обрабатывается только один раз.

## Используемые технологии

- **TypeScript** – основной язык разработки
- **NestJS** – фреймворк для создания серверных приложений
- **TypeORM** – ORM для работы с базой данных
- **@nestjs/schedule** – модуль для реализации cron-задач и периодических запусков
- **Docker** и **Docker Compose** – для контейнеризации и упрощённого развертывания

## Ключевая функциональность

- **Получение задач:**  
  Метод `takeTask()` извлекает задание со статусом `NEW` из базы данных. Для обеспечения уникальности обработки используется транзакция с блокировкой записи (`pessimistic_write`), что предотвращает одновременное выполнение одного и того же URL несколькими обработчиками.

- **Обработка задачи:**  
  Метод `taskExecution()`, запускаемый с помощью cron каждые 10 секунд, выполняет следующие шаги:
  - Извлекает доступное задание.
  - Выполняет HTTP-запрос по URL, указанному в задании.
  - При успешном запросе обновляет задание: статус меняется на `DONE`, а в поле `http_code` сохраняется код ответа.
  - При возникновении ошибки задание получает статус `ERROR`.


## Запуск проекта

### Конфигурация окружения

Перед запуском необходимо создать файл `.env` в корневой директории проекта со следующими параметрами:

```env
DB_HOST=main-db
DB_PORT=5432
DB_USERNAME=root
DB_PASSWORD=root
DATABASE=tasks
PORT=3002
PORT2=3003
```

### Запуск с помощью Docker Compose

Для запуска выполните команду:
```bash
docker-compose up --build -d
```

Это запустит:
- Два обработчика задач на портах, указанных в .env (PORT и PORT2)
- PostgreSQL базу данных на порту 5434

