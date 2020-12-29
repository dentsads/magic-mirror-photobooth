import Discord from 'discord.js';
import config from '../config.json';
import { logger } from './logger';

class DiscordAlerter {
    
    private readonly DISCORD_CHANNEL_ID:string = config.alerting.discord.channelId;
    private readonly DISCORD_BOT_TOKEN:string = process.env.DISCORD_BOT_TOKEN;
    private client;
    private IS_READY = false;


    public constructor() {
      if (!this.DISCORD_BOT_TOKEN) {
        logger.log('error', "There is no environment variable DISCORD_BOT_TOKEN set. The Discord Alerter will not be instantiated!");
        return;
      }

      this.client = new Discord.Client({
        retryLimit: 5,
        presence: {
          status: 'online',
          activity: {
            name: 'fotospiegel1',
            type: 'WATCHING'
          }
        }
      });

      this.initializeDiscordClient();      
    }
  
    public alert(message: string) {
      console.log("alert triggered")
      if (this.isReady()) {
        console.log("is ready...")
        //this.client.emit(event, args)
        this.sendMessage(message);
      }
    }
    
    private isReady(): boolean {
      return this.IS_READY;
    }

    private async sendMessage(message: string) {
      this.client.channels.fetch(this.DISCORD_CHANNEL_ID)
        .then(channel => {
            channel.send(message)
            .then(message => {
                logger.log('info', 'Sent message: "%s"', message.content);
                console.log(`Sent message: ${message.content}`);                
            })
            .catch((err) => {
              logger.log('error', err);
              console.log(err); 
            });
        })
        .catch((err) => {
          logger.log('error', err);
          console.log(err); 
        });  
    }

    private initializeDiscordClient() {
      this.client.on('ready', () => {
        logger.log('info', 'Discord client ready to send and receive messages');
        this.IS_READY = true;      
      
      });
      
      this.client.on('error', (err) => {
        logger.log('error', err);
        console.log(err); 
      });

      this.client.on('test', (args) => {
          console.log('Test triggered!');
          console.log(args)
      });

      this.client.login(this.DISCORD_BOT_TOKEN)
        .then( token => { 
          logger.log('info', 'Logged into discord as bot user "%s"', this.client.user.username);
        })
        .catch((err) => {
          logger.log('error', err);
        });
    }
  
  }
    
  export { DiscordAlerter }
  