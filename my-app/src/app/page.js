import Header from '../components/Header';
import ChatContainer from '../components/ChatContainer';
import Link from 'next/link';
export default function Home() {
  return (
    <div className="page-container">
      <Header />
      <ChatContainer />
    </div>
  );
}
