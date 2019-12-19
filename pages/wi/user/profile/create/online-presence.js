import React from 'react';
import Head from 'next/head';

import ContentSection from '../../../../../components/shared/ContentSection';
import togglePage from '../../../../../utilities/togglePage';

import Header from '../../../../../components/User/Profile/Create/Header';
import OnlinePresenceForm from '../../../../../components/User/Profile/Create/OnlinePresence';

const OnlinePresence = () => {
  return (
    <div>
      <Head>
        <title key="title">
          Create User Profile: Online Presence - THAT Conference
        </title>
      </Head>
      <ContentSection forForm>
        <Header title="Online Presence" currentStep="2" />
        <OnlinePresenceForm />
      </ContentSection>
    </div>
  );
};

export default togglePage(OnlinePresence);
