const prisma = require('../../../config/prisma');
const { responses } = require('../../../utils/response');

async function createTaskAttendance(taskId, data) {
  try {
    // Validate that the task and employee exist
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return responses.taskNotFound();
    const employee = await prisma.employee.findUnique({ where: { id: data.employee_id } });
    if (!employee) return responses.badRequest('Employee not found');

    const attendance = await prisma.task_employee_attendance.create({
      data: {
        task_id: taskId,
        employee_id: data.employee_id,
        salary_for_task: data.salary_for_task,
        status: data.status
      }
    });
    return responses.created('Task attendance created', attendance);
  } catch (error) {
    return responses.internalError('Failed to create task attendance', error.message);
  }
}

async function createBulkTaskAttendance(taskId, attendances) {
  try {
    // Validate that the task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return responses.taskNotFound();

    // Validate that all employees exist
    const employeeIds = attendances.map(a => a.employee_id);
    const existingEmployees = await prisma.employee.findMany({
      where: { 
        id: { in: employeeIds },
        is_deleted: false
      },
      select: { id: true }
    });
    
    const existingEmployeeIds = existingEmployees.map(e => e.id);
    const invalidEmployeeIds = employeeIds.filter(id => !existingEmployeeIds.includes(id));
    
    if (invalidEmployeeIds.length > 0) {
      return responses.badRequest(`Employees not found: ${invalidEmployeeIds.join(', ')}`);
    }

    // Get existing attendances for these employees
    const existingAttendances = await prisma.task_employee_attendance.findMany({
      where: {
        task_id: taskId,
        employee_id: { in: employeeIds },
        is_deleted: false
      }
    });

    // Create a map of existing attendances by employee_id
    const existingAttendanceMap = new Map(
      existingAttendances.map(attendance => [attendance.employee_id, attendance])
    );

    // Prepare operations for transaction
    const operations = attendances.map(attendance => {
      const existingAttendance = existingAttendanceMap.get(attendance.employee_id);
      
      if (existingAttendance) {
        // Update existing attendance
        return prisma.task_employee_attendance.update({
          where: { id: existingAttendance.id },
          data: {
            salary_for_task: attendance.salary_for_task,
            status: attendance.status,
            updated_at: new Date()
          }
        });
      } else {
        // Create new attendance
        return prisma.task_employee_attendance.create({
          data: {
            task_id: taskId,
            employee_id: attendance.employee_id,
            salary_for_task: attendance.salary_for_task,
            status: attendance.status
          }
        });
      }
    });

    // Execute all operations in a transaction
    const results = await prisma.$transaction(operations);

    return responses.created('Bulk task attendances processed', {
      message: 'Some records were updated, others were created',
      data: results
    });
  } catch (error) {
    return responses.internalError('Failed to process bulk task attendances', error.message);
  }
}

async function getTaskAttendances(taskId) {
  try {
    const attendances = await prisma.task_employee_attendance.findMany({
      where: { 
        task_id: taskId, 
        is_deleted: false,
        employee: {
          is_deleted: false
        }
      },
      include: {
        employee: {
          select: {
            name: true,
            role: true,
            phone: true,
            aadhar_number: true,
            is_deleted: false 
          }
        }
      }
    });

    // Flatten the employee data into the main attendance object
    const flattenedAttendances = attendances.map(attendance => {
      const { employee, ...attendanceData } = attendance;
      return {
        ...attendanceData,
        name: employee.name,
        role: employee.role,
        phone: employee.phone,
        aadhar: employee.aadhar_number
      };
    });

    return responses.retrieved('Task attendances retrieved', flattenedAttendances);
  } catch (error) {
    return responses.internalError('Failed to get task attendances', error.message);
  }
}

async function getTaskAttendanceById(taskId, attendanceId) {
  try {
    const attendance = await prisma.task_employee_attendance.findFirst({
      where: { 
        id: attendanceId, 
        task_id: taskId, 
        is_deleted: false,
        employee: {
          is_deleted: false
        }
      },
      include: {
        employee: {
          select: {
            name: true,
            role: true,
            phone: true,
            aadhar_number: true,
            is_deleted: false 
          }
        }
      }
    });
    if (!attendance) return responses.notFound('Attendance not found');

    // Flatten the employee data into the main attendance object
    const { employee, ...attendanceData } = attendance;
    const flattenedAttendance = {
      ...attendanceData,
      name: employee.name,
      role: employee.role,
      phone: employee.phone,
      aadhar: employee.aadhar_number
    };

    return responses.retrieved('Task attendance retrieved', flattenedAttendance);
  } catch (error) {
    return responses.internalError('Failed to get task attendance', error.message);
  }
}

async function updateTaskAttendance(taskId, attendanceId, data) {
  try {
    const updated = await prisma.task_employee_attendance.updateMany({
      where: { id: attendanceId, task_id: taskId, is_deleted: false },
      data: { ...data, updated_at: new Date() }
    });
    if (updated.count === 0) return responses.notFound('Attendance not found or already deleted');
    return responses.updated('Task attendance updated');
  } catch (error) {
    return responses.internalError('Failed to update task attendance', error.message);
  }
}

async function softDeleteTaskAttendance(taskId, attendanceId) {
  try {
    const deleted = await prisma.task_employee_attendance.updateMany({
      where: { id: attendanceId, task_id: taskId, is_deleted: false },
      data: { is_deleted: true, deleted_at: new Date() }
    });
    if (deleted.count === 0) return responses.notFound('Attendance not found or already deleted');
    return responses.deleted('Task attendance deleted');
  } catch (error) {
    return responses.internalError('Failed to delete task attendance', error.message);
  }
}

module.exports = {
  createTaskAttendance,
  createBulkTaskAttendance,
  getTaskAttendances,
  getTaskAttendanceById,
  updateTaskAttendance,
  softDeleteTaskAttendance
}; 