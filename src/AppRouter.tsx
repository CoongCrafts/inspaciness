import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ScrollToTop from '@/components/shared/ScrollToTop';
import MainLayout from '@/layouts/MainLayout';
import Homepage from '@/pages/Homepage';
import MySpaces from '@/pages/MySpaces';
import Space from '@/pages/Space';
import SpaceLauncher from '@/pages/SpaceLauncher';
import UploadContracts from '@/pages/UploadContracts';
import Flipper from '@/pages/plugins/Flipper';
import Posts from '@/pages/plugins/Posts';
import Members from '@/pages/space/Members';
import PendingMembers from '@/pages/space/PendingMembers';
import Settings from '@/pages/space/Settings';
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
            <Route path='posts' element={<Posts />} />,
            <Route path='flipper' element={<Flipper />} />,
            <Route path='members' element={<Members />} />,
            <Route path='settings' element={<Settings />} />,
            <Route path='pending-members' element={<PendingMembers />} />,
          </Route>
          <Route path='/upload' element={<UploadContracts />} />,
          <Route path='/launch' element={<SpaceLauncher />} />,
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
