import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../user/user.entity'

@Entity('friend_relations')
export class FriendRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  friendId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'friendId' })
  friend: User

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'

  @Column({ default: 'search' })
  source: 'search' | 'qrcode' | 'trip' | 'invite_link'

  @Column({ nullable: true })
  remarkName: string

  @Column('simple-array', { default: '' })
  groupIds: string[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
