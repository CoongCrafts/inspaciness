import { useNavigate, useParams } from 'react-router-dom';
import { findShortcut } from '@/utils/shortcuts';

export default function ShortcutRedirect() {
  const { shortcut = '' } = useParams();
  const navigate = useNavigate();

  const shortcutRecord = findShortcut(shortcut);
  if (shortcutRecord) {
    setTimeout(() => {
      navigate(`/${shortcutRecord.chainId}/spaces/${shortcutRecord.spaceAddress}`);
    });
    return null;
  }

  return <p>404: Page Not Found</p>;
}
