import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { User } from '../user/user.entity'
import { TripParticipant } from './trip-participant.entity'
import { TripTimeline } from './trip-timeline.entity'
import { TripChecklist } from './trip-checklist.entity'
import { Comment } from '../comment/comment.entity'

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  creatorId: string

  @ManyToOne(() => User, (u) => u.createdTrips)
  @JoinColumn({ name: 'creatorId' })
  creator: User

  @Column()
  title: string

  @Column({ nullable: true })
  coverUrl: string

  @Column({ default: 'other' })
  type: 'meal' | 'travel' | 'sport' | 'exhibition' | 'game' | 'study' | 'other'

  @Column({ nullable: true, type: 'text' })
  description: string

  @Column({ type: 'timestamp' })
  startTime: Date

  @Column({ nullable: true, type: 'timestamp' })
  endTime: Date

  @Column({ nullable: true })
  locationName: string

  @Column({ nullable: true })
  locationAddress: string

  @Column({ nullable: true, type: 'float' })
  latitude: number

  @Column({ nullable: true, type: 'float' })
  longitude: number

  @Column({ nullable: true })
  onlineUrl: string

  @Column({ nullable: true })
  maxParticipants: number

  @Column({ default: 'aa' })
  costType: 'aa' | 'free' | 'host_pay' | 'estimated'

  @Column({ nullable: true, type: 'float' })
  estimatedCost: number

  @Column({ default: 'friends' })
  visibility: 'private' | 'friends' | 'groups' | 'selected_friends' | 'link'

  @Column({ default: 'direct' })
  joinRule: 'direct' | 'approval' | 'waitlist'

  @Column({ default: 'published' })
  status: 'draft' | 'published' | 'cancelled' | 'completed'

  @Column('simple-array', { default: '' })
  tags: string[]

  @OneToMany(() => TripParticipant, (p) => p.trip)
  participants: TripParticipant[]

  @OneToMany(() => TripTimeline, (t) => t.trip)
  timeline: TripTimeline[]

  @OneToMany(() => TripChecklist, (c) => c.trip)
  checklist: TripChecklist[]

  @OneToMany(() => Comment, (c) => c.trip)
  comments: Comment[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
