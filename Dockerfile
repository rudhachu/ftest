FROM quay.io/princerudh/rudhra:latest
RUN git clone https://github.com/rudhachu/ftest /root/rudhra/
WORKDIR /root/rudhra/
RUN npm install -g pm2
RUN npm install
CMD ["pm2-runtime", "ecosystem.config.js"]
