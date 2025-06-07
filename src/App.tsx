import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <Layout className="min-h-screen">
        <Header className="bg-white shadow">
          <div className="container mx-auto px-4">
            <h1 className="text-xl font-bold">My App</h1>
          </div>
        </Header>
        <Content className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </Content>
        <Footer className="text-center">
          My App ©{new Date().getFullYear()} Created with React
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;
