import LoginScreen from '../../src/screens/LoginScreen';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();

  return (
    <LoginScreen
      navigation={
        {
          navigate: (screen: string) => router.push(screen as any),
          goBack: () => router.back(),
        } as any
      }
    />
  );
}
