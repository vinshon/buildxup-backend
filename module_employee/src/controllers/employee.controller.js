const prisma = require('../../../config/prisma');
const { responses } = require('../../../utils/response');

async function createEmployee(data) {
  try {
    // Check if employee with same Aadhar number exists
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        aadhar_number: data.aadhar_number,
        is_deleted: false
      }
    });

    if (existingEmployee) {
      return responses.conflict('Employee with this Aadhar number already exists');
    }

    const employee = await prisma.employee.create({ data });
    return responses.created('Employee created', employee);
  } catch (error) {
    if (error.code === 'P2002') {
      return responses.conflict('Employee with this Aadhar number already exists');
    }
    return responses.internalError('Failed to create employee', error.message);
  }
}

async function getEmployees() {
  try {
    const employees = await prisma.employee.findMany({ where: { is_deleted: false } });
    return responses.retrieved('Employees retrieved', employees);
  } catch (error) {
    return responses.internalError('Failed to get employees', error.message);
  }
}

async function getEmployeeById(id) {
  try {
    const employee = await prisma.employee.findFirst({ where: { id, is_deleted: false } });
    if (!employee) return responses.notFound('Employee not found');
    return responses.retrieved('Employee retrieved', employee);
  } catch (error) {
    return responses.internalError('Failed to get employee', error.message);
  }
}

async function updateEmployee(id, data) {
  try {
    const updated = await prisma.employee.updateMany({
      where: { id, is_deleted: false },
      data: { ...data, updated_at: new Date() }
    });
    if (updated.count === 0) return responses.notFound('Employee not found or already deleted');
    return responses.updated('Employee updated');
  } catch (error) {
    return responses.internalError('Failed to update employee', error.message);
  }
}

async function softDeleteEmployee(id) {
  try {
    const deleted = await prisma.employee.updateMany({
      where: { id, is_deleted: false },
      data: { is_deleted: true, deleted_at: new Date() }
    });
    if (deleted.count === 0) return responses.notFound('Employee not found or already deleted');
    return responses.deleted('Employee deleted');
  } catch (error) {
    return responses.internalError('Failed to delete employee', error.message);
  }
}

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  softDeleteEmployee
}; 