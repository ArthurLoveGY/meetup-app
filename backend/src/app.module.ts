import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { TripModule } from './trip/trip.module'
import { FriendModule } from './friend/friend.module'
import { CommentModule } from './comment/comment.module'
import { NotificationModule } from './notification/notification.module'
import { VoteModule } from './vote/vote.module'
import { BudgetModule } from './budget/budget.module'
import { UploadModule } from './upload/upload.module'
import { ChatModule } from './chat/chat.module'
import { StatsModule } from './stats/stats.module'
import { AnnouncementModule } from './announcement/announcement.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'tripcircle',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UserModule,
    TripModule,
    FriendModule,
    CommentModule,
    NotificationModule,
    VoteModule,
    BudgetModule,
    UploadModule,
    ChatModule,
    StatsModule,
    AnnouncementModule,
  ],
})
export class AppModule {}
