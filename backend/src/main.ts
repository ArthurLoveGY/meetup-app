import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './common/response.interceptor'
import { HttpExceptionFilter } from './common/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  app.enableCors({
    origin: ['http://localhost:10086', 'https://servicewechat.com'],
    credentials: true,
  })
  
  app.useWebSocketAdapter(new IoAdapter(app))

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }))
  
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())
  app.setGlobalPrefix('api')
  
  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`TripCircle backend running on port ${port}`)
}

bootstrap()
