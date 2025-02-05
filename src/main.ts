import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { S3Service } from "./s3/s3.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  app.use(cookieParser());

  const s3Service = app.get(S3Service);
  await s3Service.checkAndCreateBucket();

  const PORT = 3000;
  await app.listen(PORT, async () => {
    console.log(`Serves has been started on PORT ${PORT}`);
  });
}
bootstrap();
