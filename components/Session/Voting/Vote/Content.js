import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import parse from 'html-react-parser';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import ButterToast, { Cinnamon, POS_TOP, POS_RIGHT } from 'butter-toast';

import LoadingIndicator from '../../../shared/LoadingIndicator';
import NavLinks from '../Shared/NavLinks';
import Thumbs from '../Shared/Thumbs';
import Stats from '../Shared/Stats';

const MarkdownIt = require('markdown-it');

const MainContent = styled.div`
  margin-top: 0rem;
`;

const Section = styled.div`
  margin-bottom: 3rem;

  ul {
    margin-top: 0;
  }
`;

const DetailsHeader = styled.div`
  font-size: 2rem;
`;

const GET_SESSIONS = gql`
  query getVotingSessions($eventId: ID!) {
    sessions {
      me {
        voting(eventId: $eventId) {
          isVotingOpen
          totalSubmitted
          unVoted {
            id
            title
            longDescription
            takeaways
          }
        }
      }
    }
  }
`;

const CAST_VOTE = gql`
  mutation castVote($eventId: ID!, $vote: VoteInput!) {
    sessions {
      voting(eventId: $eventId) {
        cast(vote: $vote) {
          id
          notes
          memberId
        }
      }
    }
  }
`;

const Content = () => {
  console.log('**** Rendering ****');
  const [notes, setNotes] = useState('');
  const [value, setValue] = useState(0);
  const [feedbackFocused, setFeedbackFocused] = useState('foo');
  console.log(`FeedbackFocused 1: ${feedbackFocused}`);
  let someBool = false;

  let session = null;
  let toastId = null;

  const forceUpdate = () => {
    ButterToast.dismiss(toastId);
    ButterToast.raise({
      sticky: false,
      content: (
        <Cinnamon.Crisp
          scheme={Cinnamon.Crisp.SCHEME_BLUE}
          content={() => <div>Vote successfully cast!</div>}
          title="Vote"
        />
      ),
    });
    setValue(value + 1);
    window.scrollTo(0, 0);
  };

  const [castVote] = useMutation(CAST_VOTE, {
    onCompleted: forceUpdate,
    onError: createError => {
      throw new Error(createError);
    },
  });

  const submitVote = yesVote => {
    toastId = ButterToast.raise({
      sticky: false,
      content: (
        <Cinnamon.Crisp
          scheme={Cinnamon.Crisp.SCHEME_BLUE}
          content={() => <div>Casting Vote...</div>}
          title="Vote"
        />
      ),
    });
    const vars = {
      eventId: process.env.CURRENT_EVENT_ID,
      vote: {
        sessionId: session.id,
        vote: yesVote,
        notes,
      },
    };
    castVote({
      variables: vars,
    });
  };

  const isFeedbackFocused = () => {
    console.log(`FeedbackFocused 3: ${feedbackFocused}`);

    return feedbackFocused;
  };

  // const isFocused = () => isFeedbackFocused;

  // const handleKeyPress = key => {
  //   console.log(key);

  //   console.log(`Feedback Has Focus XXXX: ${isFocused()}`);
  //   const yesValues = ['y', 'Y'];
  //   const validVotes = [...yesValues, 'n', 'N'];
  //   if (validVotes.includes(key)) {
  //     const vote = yesValues.includes(key);
  //   }
  // };

  useEffect(() => {
    const keyPressHandler = e => {
      const { key } = e;
      console.log(`KeyPressHandler - Key: ${key}`);
      console.log(`KeyPressHandler - FeedbackFocused: ${isFeedbackFocused()}`);
      console.log(`SomeBool: ${someBool}`);
      const yesValues = ['y', 'Y'];
      const validVotes = [...yesValues, 'n', 'N'];
      if (validVotes.includes(key)) {
        const vote = yesValues.includes(key);
      }
    };

    document.addEventListener('keyup', keyPressHandler);
    return () => {
      document.removeEventListener('keyp', keyPressHandler);
    };
  }, []);

  const {
    loading: sessionsLoading,
    error: sessionsError,
    data: sessionsData,
  } = useQuery(GET_SESSIONS, {
    variables: { eventId: process.env.CURRENT_EVENT_ID },
  });

  if (sessionsLoading) {
    return (
      <div style={{ textAlign: 'center', margin: '10rem 0 7rem 0' }}>
        <LoadingIndicator />
      </div>
    );
  }
  if (sessionsError) throw new Error(sessionsError);

  const root = sessionsData.sessions.me.voting;

  const { totalSubmitted } = root;
  const totalRemaining = root.unVoted.length - (value + 1);
  const totalVotedOn = totalSubmitted - totalRemaining;

  session = root.unVoted ? root.unVoted[value] : null;

  if (session) {
    console.log(`FeedbackFocused 2: ${feedbackFocused}`);

    const converter = new MarkdownIt();
    return (
      <MainContent>
        <NavLinks
          forwardLabel="Review Your Votes"
          forwardLink="/wi/session/voting/review"
        />
        <h3>{session.title}</h3>
        <Section>{parse(converter.render(session.longDescription))}</Section>
        {session.takeaways && (
          <Section>
            <DetailsHeader>Key Takeaways</DetailsHeader>
            <ul>
              {session.takeaways.map(s => {
                return (
                  <React.Fragment key={s}>
                    <li>{s}</li>
                  </React.Fragment>
                );
              })}
            </ul>
          </Section>
        )}
        <Section>
          <DetailsHeader>Organizer Feedback</DetailsHeader>
          <form className="input-form">
            <textarea
              rows="5"
              onChange={event => {
                setNotes(event.target.value);
                // setFeedbackFocused(true);
              }}
              onFocus={() => {
                console.log('OnFocus...');
                setFeedbackFocused('bar');
                someBool = true;
              }}
              // onFocusOut={() => setFeedbackFocused(false)}
            />
          </form>
        </Section>
        <Thumbs iconHeight="15rem" submit={submitVote} />
        <Stats
          totalSubmitted={totalSubmitted}
          totalVotedOn={totalVotedOn}
          totalRemaining={totalRemaining}
        />
        <ButterToast
          className="that-toast"
          position={{
            vertical: POS_TOP,
            horizontal: POS_RIGHT,
          }}
        />
      </MainContent>
    );
  }

  return <p>You have voted for all the sessions....GOOD JOB!</p>;
};

export default Content;
