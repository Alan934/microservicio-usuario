import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { RpcException } from '@nestjs/microservices';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService extends PrismaClient implements OnModuleInit{

    private readonly logger = new Logger('UsersService');
    onModuleInit() {
        this.$connect();
        this.logger.log('Connected to DB');
    }

    create(createUserDto: CreateUserDto) {
        return this.user.create({ data: createUserDto });
    }

    findAll() {
        return this.user.findMany({
            select:{
                id: true,
                email: true,
                password: true,
                nombre: true,
                apellido: true,
                direccion: true,
            },
            where:{
                available: true,
            }
        });
    }

    async findOne(id: number) {
        const user = await this.user.findFirst({
            where: {
                id,
                available: true
            }
        });

        if (!user) {
            throw new RpcException({
                message: 'User not found',
                status: HttpStatus.BAD_REQUEST,
            })
        }

        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const { id: __, ...data } = updateUserDto;

        const userId = await this.findOne(id);

        if(!userId) {
            throw new RpcException({
                message: 'User not found',
                status: HttpStatus.BAD_REQUEST,
            })
        }

        return this.user.update({ 
            where: { id }, 
            data: data 
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        
        const user = await this.user.update({
            where: { id },
            data: {
                available: false
            }
        });

        return user;
    }
}
