import { getAvatarUrl } from '../utils/avatar';

const Avatar = ({ seed }) => {
  return <img src={getAvatarUrl(seed)} alt="Avatar" />;
};