// Modal.js
import React from "react";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; // Ensure the modal is on top of other elements
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  position: relative;
  width: 80%; // Responsive width
  max-width: 600px; // Max width for larger screens
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: ${({ theme }) => theme.text_secondary};

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const Modal = ({ isOpen, onClose, project }) => {
  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>✖</CloseButton>
        <h2>{project.title}</h2>
        <img
          src={project.image}
          alt={project.title}
          style={{ width: "100%", borderRadius: "10px" }}
        />
        <p>{project.description}</p>
        <h3>Members:</h3>
        <div>
          {project.members?.map((member, index) => (
            <img
              key={index}
              src={member.img}
              alt={member.name}
              style={{ width: "38px", borderRadius: "50%", margin: "0 5px" }}
            />
          ))}
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
