import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { S3Service } from "./s3/s3.service";
import { SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import * as YAML from "yamljs";
import * as path from "path";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const document = YAML.load(path.join(__dirname, "../swagger.yaml"));

  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  app.use(cookieParser());

  SwaggerModule.setup("api/docs", app, document);

  const s3Service = app.get(S3Service);
  await s3Service.checkAndCreateBucket();

  const PORT = 3000;
  await app.listen(PORT, async () => {
    console.log(`Serves has been started on PORT ${PORT}`);
    console.log(`Documentation in swagger: /api/docs`);
  });
}
bootstrap();
