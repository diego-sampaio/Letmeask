import { useState, FormEvent } from 'react';
import { useHistory } from 'react-router-dom';
import firebase from 'firebase';

import { useAuth } from '../hooks/useAuth';

import { database } from '../services/firebase';

import { Button } from '../components/Button';

import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';
import googleIconImg from '../assets/images/google-icon.svg';

import '../styles/auth.scss';

export function Home() {
  const history = useHistory();

  const { user, signInWithGoogle } = useAuth();

  const [roomCode, setRoomCode] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  
  async function handleCreateRoom() {
    if (!user) {
      await signInWithGoogle();
    }

    history.push('/rooms/new');
  }

  async function handleJoinRoom(event: FormEvent) {
    event.preventDefault();

    if (roomCode.trim() === '') {
      return;
    }

    const roomRef = await database.ref(`rooms/${roomCode}`).get();

    if (!roomRef.exists()) {
      alert('Room does not exists.');
      return;
    }

    history.push(`/rooms/${roomCode}`);
  }

  function handleAuthPhoneNumber(event: FormEvent) {
    event.preventDefault();

    if (phoneNumber.trim() === '') {
      return;
    }

    const phoneNumberRef = database.ref('rooms/sms');

    phoneNumberRef.push({
      phoneNumber: phoneNumber,
    });

    const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in', { 'size': 'invisible' });

    firebase.auth().signInWithPhoneNumber(phoneNumber, recaptchaVerifier).then((confirmationResult) => {
      const confirmationCode = confirmationResult;

      // alert(`A verification code was sent to number: ${phoneNumber}`);

      const code = window.prompt('Digite o código:');

      if (!code) {
        return;
      }

      confirmationResult.confirm(code).then((result) => {
        const user = result.user;

        history.push('/rooms/new');
        }).catch((error) => {
          alert(error.code);
      });

    }).catch((error) => {
      alert(error.code);
    });
  }

  return (
    <div id="page-auth">
      <aside>
        <img src={illustrationImg} alt="Ilustração simbolizando perguntas e respostas" />
        <strong>Crie salas de Q&amp;A ao-vivo</strong>
        <p>Tire as dúvidas da sua audiência em tempo-real</p>
      </aside>
      <main>
        <div className="main-content">
          <img src={logoImg} alt="Letmeask" />
          <button onClick={handleCreateRoom} className="create-room">
            <img src={googleIconImg} alt="Logo do Google" />
            Crie sua sala com o Google
          </button>
          <div className="separator">Logar via SMS</div>
          <form onSubmit={handleAuthPhoneNumber}>
            <input type="text" placeholder="Digite o número do celular" onChange={event => setPhoneNumber(event.target.value)} value={phoneNumber} />
            <Button type="submit" id="sign-in">Enviar SMS</Button>
          </form>
          <div className="separator">Ou entre em uma sala</div>
          <form onSubmit={handleJoinRoom}>
            <input type="text" placeholder="Digite o código da sala" onChange={event => setRoomCode(event.target.value)} value={roomCode} />
            <Button type="submit">Entrar na sala</Button>
          </form>
        </div>
      </main>
    </div>
  )
}

/**
 * Usando o 'export function Home()', eu obrigatoriamente (quando for importá-lo) preciso usar o nome exato do componente, no caso 'Home'.
 * Caso eu use o 'export default Home' no final do arquivo, e, em algum momento altere o nome do componente, onde ele for importado irá
 * continuar funcionando com o nome anterior.
 */