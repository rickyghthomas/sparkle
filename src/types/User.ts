interface Experience {
  bartender: User;
  table: string;
}

//@debt typing I think this is correct from Room.tsx, need to confirm
type UserExperienceData = Record<string, Experience>;

// Store all things related to video chat where they can't be tampered with by other users
export type VideoState = {
  inRoomOwnedBy?: string;
  removedParticipantUids?: string[];
  invitingUid?: string;
  askingToJoinUid?: string;
  acceptingRequestFromUid?: string;
};

export interface User {
  drinkOfChoice?: string;
  favouriteRecord?: string;
  doYouDance?: string;
  partyName?: string;
  pictureUrl?: string;
  data?: UserExperienceData;
  lastSeenIn: string;
  room?: string;
  // @debt typing - user also has a dynamic set of attributes for the question answers
  // currently not possible to type them properly
  // [question: string]: string;
  video?: VideoState;
}
