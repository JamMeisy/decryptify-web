"use client";

import React from 'react';
import Layout from "../../components/layout/Layout";
import Chat from "../../components/chat/Chat";

export default function ChatPage() {
  return (
    <Layout>
      <div className="w-full h-full flex flex-col">
        <Chat />
      </div>
    </Layout>
  );
}
