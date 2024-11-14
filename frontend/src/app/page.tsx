'use client'

import styles from "./page.module.css";
import ky from 'ky';
import React, {useState, useEffect} from 'react';
import {Button, ChakraProvider, Checkbox, IconButton, Input, Table, TableContainer, Tbody, Td, Th, Thead, Tr} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

interface Task {
  id: number;
  text: string;
  created_at: Date;
  done: boolean;
}

const handlePostTask = async (text: string, data: Task[], setData: React.Dispatch<React.SetStateAction<Task[]>>) => {
  console.log(text);
  // Make the API call to create a new task on the server
  const response = await ky.post('http://localhost:8000/', {
    json: {text: text}
  });
  console.log(response)
  const newTask: Task = await response.json();

  // Update the task state locally
  setData([...data, newTask]);
}

const handleCheckboxChange = async (id: number, setData: React.Dispatch<React.SetStateAction<Task[]>>) => {
  console.log(id);
  // Update the task state locally
  setData((prevData) =>
    prevData.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    )
  );

  // Make the API call to update the task on the server
  await ky.post('http://localhost:8000/check/' + id);
}

const handleDeleteTask = async (id: number, setData: React.Dispatch<React.SetStateAction<Task[]>>) => {
  console.log(id);
  // Update the task state locally
  setData((prevData) =>
    prevData.filter((task) => task.id !== id)
  );

  // Make the API call to update the task on the server
  await ky.delete('http://localhost:8000/check/' + id);
}

function App() {
  const [data, setData] = useState<Task[]>([]);
  const [text, setText] = useState<string>('');
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await ky.get('http://localhost:8000/');
      const tasks: Task[] = await response.json();
      setData(tasks);
    };
    fetchData();
  }, []);

  return (
    <ChakraProvider>
      <div className={styles.page}>
        <h1>wow what a great app 9.4/10</h1>

        <TableContainer style={{width: "80%"}}>
          <Table variant="simple" colorScheme="green">
            <Thead>
              <Tr>
                <Th>TASK</Th>
                <Th>CREATED AT</Th>
                <Th>COMPLETED</Th>
                <Th>DELETE</Th>
              </Tr>
            </Thead>
            <Tbody>

              {data.map((task) => (
                <Tr key={task.id}>
                  <Td> {task.text} </Td>
                  <Td> {new Date(task.created_at).toLocaleString()} </Td>
                  <Td> <Checkbox size='lg' isChecked={task.done} onChange={() => handleCheckboxChange(task.id, setData)}></Checkbox> </Td>
                  <Td> 
                    <IconButton
                      variant='outline'
                      colorScheme='red'
                      aria-label='Delete Task'
                      icon={<DeleteIcon 
                      onClick={() => handleDeleteTask(task.id, setData)}/>}
                    />
                  </Td>
                </Tr>
              ))}

                <Tr>
                  <Td> <Input value = {text} onChange={(e) => {setText(e.target.value)}}></Input> </Td>
                  <Td> - </Td>
                  <Td> <Checkbox size='lg' isChecked={false} disabled = {true}></Checkbox> </Td>
                  <Td> <Button onClick={() => {handlePostTask(text, data, setData); setText('')}}> + </Button> </Td>
                </Tr>

            </Tbody>
          </Table>
        </TableContainer>

      </div>
    </ChakraProvider>
  );
}

export default App;