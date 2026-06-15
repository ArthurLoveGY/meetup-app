import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Vote } from './vote.entity'

@Entity('vote_options')
export class VoteOption {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  voteId: string

  @ManyToOne(() => Vote, (v) => v.options)
  @JoinColumn({ name: 'voteId' })
  vote: Vote

  @Column()
  text: string

  @Column('simple-array', { default: '' })
  votedUserIds: string[]
}
