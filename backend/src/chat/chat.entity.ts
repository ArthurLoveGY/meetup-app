import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Trip } from '../trip/trip.entity'
import { User } from '../user/user.entity'

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  tripId: string

  @ManyToOne(() => Trip)
  @JoinColumn({ name: 'tripId' })
  trip: Trip

  @Column()
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column('text')
  content: string

  @Column({ default: 'text' })
  type: 'text' | 'image' | 'system'

  @CreateDateColumn()
  createdAt: Date
}
