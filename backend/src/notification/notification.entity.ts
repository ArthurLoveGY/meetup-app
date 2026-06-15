import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../user/user.entity'

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  type: 'friend_request' | 'trip_invite' | 'trip_update' | 'join_status' | 'comment' | 'reminder' | 'system'

  @Column()
  title: string

  @Column()
  content: string

  @Column({ nullable: true })
  relatedId: string

  @Column({ default: false })
  read: boolean

  @CreateDateColumn()
  createdAt: Date
}
