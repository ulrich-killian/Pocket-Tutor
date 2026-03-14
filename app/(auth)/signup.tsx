import SignupScreen from '../../src/screens/SignupScreen';
import { useRouter } from 'expo-router';

export default function Signup() {
  const router = useRouter();

  return (
    <SignupScreen
      navigation={{
        navigate: (screen: string) => router.push(screen as any),
        goBack: () => router.back(),
      }}
    />
  );
}
