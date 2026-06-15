import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Trip } from '../trip/trip.entity'
import { TripParticipant } from '../trip/trip-participant.entity'
import { Comment } from '../comment/comment.entity'
import { FriendRelation } from '../friend/friend.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  nickname: string

  @Column({ nullable: true })
  avatarUrl: string

  @Column({ nullable: true })
  bio: string

  @Column({ nullable: true })
  city: string

  @Column('simple-array', { default: '' })
  interests: string[]

  @Column({ nullable: true, unique: true })
  phone: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true, unique: true })
  wechatOpenId: string

  @Column({ nullable: true })
  unionId: string

  @Column({ nullable: true })
  appleUserId: string

  @Column({ default: 'active' })
  status: 'active' | 'disabled' | 'deleted'

  @OneToMany(() => Trip, (trip) => trip.creator)
  createdTrips: Trip[]

  @OneToMany(() => TripParticipant, (p) => p.user)
  participations: TripParticipant[]

  @OneToMany(() => Comment, (c) => c.user)
  comments: Comment[]

  @OneToMany(() => FriendRelation, (f) => f.user)
  friends: FriendRelation[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
