import api from './api';

export enum PollStatus {
  OPEN = 'open',
  CLOSED = 'closed'
}

export interface PollOption {
  id: number;
  text: string;
  vote_count: number;
}

export interface Poll {
  id: number;
  question: string;
  description?: string;
  status: PollStatus;
  end_date?: string;
  created_at: string;
  options: PollOption[];
  user_has_voted: boolean;
}

export interface PollCreate {
  question: string;
  description?: string;
  end_date?: string;
  options: string[];
}

export const pollService = {
  getPolls: () => api.get<Poll[]>('/polls/'),
  createPoll: (data: PollCreate) => api.post<Poll>('/polls/', data),
  deletePoll: (id: number) => api.delete<Poll>(`/polls/${id}`),
  vote: (pollId: number, optionId: number) => api.post<Poll>(`/polls/${pollId}/vote`, { option_id: optionId })
};
