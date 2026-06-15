import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Trip } from '../trip/trip.entity'
import { User } from '../user/user.entity'

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  tripId: string

  @ManyToOne(() => Trip, (t) => t.comments)
  @JoinColumn({ name: 'tripId' })
  trip: Trip

  @Column()
  userId: string

  @ManyToOne(() => User, (u) => u.comments)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ nullable: true })
  parentId: string

  @Column('text')
  content: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
