import React, { Component } from 'react';
import Notiflix from 'notiflix';
import GlobalStyles from '../../GlobalStyles';
import { nanoid } from 'nanoid';
import ContactForm from '../ContactForm';
import Filter from '../Filter';
import ContactList from '../ContactList';
import Notification from '../Notification';
import {
  Container,
  WrapForms,
  WrapList,
  FormTitle,
  ListTitle,
} from './App.styled';

Notiflix.Notify.init({
  width: '500px',
  position: 'center-top',
  closeButton: true,
  fontFamily: 'Comic Sans MS',
  fontSize: '24px',
  warning: {
    background: 'rgb(255, 240, 245)',
    textColor: 'rgb(40, 70, 219)',
    notiflixIconColor: 'rgb(205, 92, 92)',
  },
});

export type Contact = {
  id: string;
  name: string;
  number: string;
};

export type AppState = {
  contacts: Contact[];
  filter: string;
};

export default class App extends Component<{}, AppState> {
  state: AppState = {
    contacts: [],
    filter: '',
  };

  componentDidMount(): void {
    try {
      const contactsJSON: string | null = localStorage.getItem('contacts');
      if (contactsJSON) {
        const contacts: Contact[] = JSON.parse(contactsJSON);
        this.setState({
          contacts: contacts,
        });
      }
    } catch (error) {
      console.error('Get state error: ', (error as Error).message);
    }
  }

  componentDidUpdate(_: any, prevState: AppState): void {
    if (this.state.contacts !== prevState.contacts) {
      try {
        localStorage.setItem('contacts', JSON.stringify(this.state.contacts));
      } catch (error) {
        console.error('Set state error: ', (error as Error).message);
      }
    }
  }


  findContactByName = (name: string): Contact | undefined => {
    const { contacts } = this.state;
    return contacts.find(item => item.name.toLowerCase() === name);
  };

  formSubmitHandler = (data: { name: string; number: string }) => {
    const { name, number } = data;
    const normalizedName = name.toLowerCase();
    if (this.findContactByName(normalizedName)) {
      Notiflix.Notify.warning(`${name} is already in contacts`);
      return;
    }
    this.addContact(name, number);
  };

  addContact = (name: string, number: string) => {
    const contact = {
      id: nanoid(),
      name,
      number,
    };
    this.setState(({ contacts }) => ({
      contacts: [contact, ...contacts],
    }));
  };

  deleteContact = (id: string) => {
    this.setState(prevState => ({
      contacts: prevState.contacts.filter(contact => contact.id !== id),
    }));
  };

  getVisibleContacts = (): Contact[] => {
    const { contacts, filter } = this.state;
    const normalizedFilter = filter.toLowerCase();
    return contacts.filter(({ name }) =>
      name.toLowerCase().includes(normalizedFilter)
    );
  };

  changeFilter = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ filter: evt.currentTarget.value });
  };

  render() {
    const { contacts, filter } = this.state;
    const filteredContacts = this.getVisibleContacts();
    return (
      <Container>
        <GlobalStyles />
        <WrapForms>
          <FormTitle>Phonebook</FormTitle>
          <ContactForm onSubmit={this.formSubmitHandler} />
          <Filter filter={filter} onChange={this.changeFilter} />
        </WrapForms>
        <WrapList>
          <ListTitle>Contacts</ListTitle>
          {contacts.length > 0 ? (
            <ContactList
              contacts={filteredContacts}
              onDeleteContact={this.deleteContact}
            />
          ) : (
            <Notification message="There is no contact in Phonebook" />
          )}
        </WrapList>
      </Container>
    );
  }
}
