import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ScrollToTop from '@/components/shared/ScrollToTop';
import MainLayout from '@/layouts/MainLayout';
import Faucets from '@/pages/Faucets';
import Homepage from '@/pages/Homepage';
import MySpaces from '@/pages/MySpaces';
import ShortcutRedirect from '@/pages/ShortcutRedirect';
import SpaceLauncher from '@/pages/SpaceLauncher';
import UploadContracts from '@/pages/UploadContracts';
import Flipper from '@/pages/plugins/Flipper';
import Polls from '@/pages/plugins/Polls';
import Posts from '@/pages/plugins/Posts';
import PendingPosts from '@/pages/plugins/Posts/0.2.x/PendingPosts';
import Space from '@/pages/space';
import Members from '@/pages/space/0.1.x/Members';
import PendingMembers from '@/pages/space/0.1.x/PendingMembers';
import Settings from '@/pages/space/0.1.x/Settings';
import Explorer from 'src/pages/Explorer';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Homepage />} />
          <Route path='/spaces' element={<MySpaces />} />,
          <Route path='/explore' element={<Explorer />} />,
          <Route path='/:chainId/spaces/:spaceAddress' element={<Space />}>
            <Route path='polls' element={<Polls />} />,
            <Route path='posts' element={<Posts />} />,
            <Route path='flipper' element={<Flipper />} />,
            <Route path='members' element={<Members />} />,
            <Route path='settings' element={<Settings />} />,
            <Route path='pending-members' element={<PendingMembers />} />,
            <Route path='pending-posts' element={<PendingPosts />} />,
          </Route>
          <Route path='/upload' element={<UploadContracts />} />,
          <Route path='/launch' element={<SpaceLauncher />} />,
          <Route path='/faucets' element={<Faucets />} />,
        </Route>
        <Route path='/:shortcut' element={<ShortcutRedirect />} />,
      </Routes>
    </BrowserRouter>
  );
}
