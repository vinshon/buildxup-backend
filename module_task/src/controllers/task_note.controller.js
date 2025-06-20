const prisma = require('../../../config/prisma');
const { responses } = require('../../../utils/response');

async function createTaskNote(taskId, data) {
  try {
    const note = await prisma.task_note.create({
      data: { ...data, task_id: taskId }
    });
    return responses.created('Task note created', note);
  } catch (error) {
    return responses.internalError('Failed to create task note', error.message);
  }
}

async function getTaskNotes(taskId) {
  try {
    const notes = await prisma.task_note.findMany({
      where: { task_id: taskId, is_deleted: false }
    });
    return responses.retrieved('Task notes retrieved', notes);
  } catch (error) {
    return responses.internalError('Failed to get task notes', error.message);
  }
}

async function getTaskNoteById(taskId, noteId) {
  try {
    const note = await prisma.task_note.findFirst({
      where: { id: noteId, task_id: taskId, is_deleted: false }
    });
    if (!note) return responses.notFound('Note not found');
    return responses.retrieved('Task note retrieved', note);
  } catch (error) {
    return responses.internalError('Failed to get task note', error.message);
  }
}

async function updateTaskNote(taskId, noteId, data) {
  try {
    const updated = await prisma.task_note.updateMany({
      where: { id: noteId, task_id: taskId, is_deleted: false },
      data: { ...data, updated_at: new Date() }
    });
    if (updated.count === 0) return responses.notFound('Note not found or already deleted');
    return responses.updated('Task note updated');
  } catch (error) {
    return responses.internalError('Failed to update task note', error.message);
  }
}

async function softDeleteTaskNote(taskId, noteId) {
  try {
    const deleted = await prisma.task_note.updateMany({
      where: { id: noteId, task_id: taskId, is_deleted: false },
      data: { is_deleted: true, deleted_at: new Date() }
    });
    if (deleted.count === 0) return responses.notFound('Note not found or already deleted');
    return responses.deleted('Task note deleted');
  } catch (error) {
    return responses.internalError('Failed to delete task note', error.message);
  }
}

module.exports = {
  createTaskNote,
  getTaskNotes,
  getTaskNoteById,
  updateTaskNote,
  softDeleteTaskNote
}; 