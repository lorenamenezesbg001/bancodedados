import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

interface Tarefa {
  id: number;
  nome: string;
}

export default function App() {
  const [banco, setBanco] = useState<SQLite.SQLiteDatabase | null>(null);
  const [tarefa, setTarefa] = useState<string>('');
  const [listaTarefa, setListaTarefa] = useState<Tarefa[]>([]);

  useEffect(() => {
    async function iniciarBanco() {
      const db = await SQLite.openDatabaseAsync('lorena.db');

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS tarefas(
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          nome TEXT NOT NULL
        );
      `);
      setBanco(db);
      atualizarLista(db);
    }
    iniciarBanco();
  }, []);

  async function atualizarLista(db: SQLite.SQLiteDatabase) {
    const resultado = await db.getAllAsync<Tarefa>('SELECT * FROM tarefas');
    setListaTarefa(resultado);
  }

  async function adicionarTarefa() {
    if (tarefa.trim() === '' || !banco) return;
    await banco.runAsync('INSERT INTO tarefas(nome) VALUES(?)', [tarefa]);
    setTarefa('');
    atualizarLista(banco);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gerenciador de Tarefas</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="O que precisa ser feito?"
          value={tarefa}
          onChangeText={setTarefa}
        />

        <TouchableOpacity style={styles.botao} onPress={adicionarTarefa}>
          <Text style={styles.textoBotao}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={listaTarefa}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardTarefa}>
            <Text style={styles.textoTarefa}>{item.nome}</Text>
          </View>
        )}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  botao: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardTarefa: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 5,
    marginBottom: 10,
  },
  textoTarefa: {
    fontSize: 16,
  },
});