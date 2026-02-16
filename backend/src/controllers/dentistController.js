
const prisma = require('../config/prisma');

exports.getDentists = async (req, res, next) => {
  try {
    const dentists = await prisma.dentist.findMany({
      include: { schedules: true }
    });
    // Map specialty -> specialization for frontend compatibility
    res.json(dentists.map(d => ({ ...d, specialization: d.specialty })));
  } catch (error) {
    next(error);
  }
};

exports.createDentist = async (req, res, next) => {
  try {
    const { name, specialization, specialty, experience, imageUrl, bio } = req.body;
    
    let finalImageUrl = imageUrl;
    if (req.file) {
      finalImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const dentist = await prisma.dentist.create({
      data: {
        name,
        specialty: specialization || specialty || 'General',
        experience: experience ? parseInt(experience) : 0,
        imageUrl: finalImageUrl || "https://picsum.photos/seed/doc/200",
        bio: bio || undefined
      }
    });
    res.status(201).json(dentist);
  } catch (error) {
    next(error);
  }
};

exports.deleteDentist = async (req, res, next) => {
  try {
    await prisma.dentist.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.getSchedules = async (req, res, next) => {
  try {
    const { dentistId } = req.query;
    const where = dentistId ? { dentistId } : {};
    const schedules = await prisma.schedule.findMany({ where });
    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

exports.createSchedule = async (req, res, next) => {
  try {
    const schedule = await prisma.schedule.create({ data: req.body });
    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
};

exports.deleteSchedule = async (req, res, next) => {
  try {
    await prisma.schedule.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
