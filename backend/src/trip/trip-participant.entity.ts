import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Trip } from './trip.entity'
import { User } from '../user/user.entity'

@Entity('trip_participants')
export class TripParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  tripId: string

  @ManyToOne(() => Trip, (t) => t.participants)
  @JoinColumn({ name: 'tripId' })
  trip: Trip

  @Column()
  userId: string

  @ManyToOne(() => User, (u) => u.participations)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ default: 'interested' })
  status: 'interested' | 'confirmed' | 'uncertain' | 'waitlist' | 'declined' | 'cancelled'

  @Column({ nullable: true })
  note: string

  @Column({ default: 'participant' })
  role: 'creator' | 'participant'

  @CreateDateColumn()
  joinedAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
