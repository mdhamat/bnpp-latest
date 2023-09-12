"use strict";

var utils = require("../utils/writer.js");
var ServiceInstances = require("../service/ServiceInstancesService");
var lib = require("../utils/authentication.js");
// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
var MongoClient = require("mongodb").MongoClient;

const url = process.env.BNPP_MONGO_CS;

const client = new MongoClient(url, {
  ssl: true,
  tlsCAFile: "/app/87ca6778-6d9d-11e9-b6bc-be2dba81101c",
});

module.exports.serviceInstanceDeprovisionUsingDELETE =
  function serviceInstanceDeprovisionUsingDELETE(
    req,
    res,
    next,
    service_id,
    plan_id,
    xBrokerAPIVersion,
    instance_id,
    xBrokerAPIOriginatingIdentity,
    accepts_incomplete
  ) {
    let authenticated = lib.authenticate(req, res, next);
    if (authenticated) {
      ServiceInstances.serviceInstanceDeprovisionUsingDELETE(
        service_id,
        plan_id,
        xBrokerAPIVersion,
        instance_id,
        xBrokerAPIOriginatingIdentity,
        accepts_incomplete
      )
        .then(async (response) => {
          const current_epoch = Date.now();

          await client.connect();
          const dbo = client.db("mydb");

          var updated_fields = {
            stopped_at: current_epoch,
            activated: false,
          };
          const filter = { instance_id: instance_id };
          const updateOperation = {
            $set: updated_fields,
          };

          try {
            await dbo.collection("users").updateOne(filter, updateOperation);
          } catch (err) {
            console.log("Error while updating databse : ", err);
          }

          //send mail
          // const msg = {
          //   to: process.env.MAIL_TO,
          //   from: process.env.MAIL_FROM,
          //   subject: "Deprovision Request",
          //   html: `<b>Plan ID :</b> ${plan_id}<br><b>Service ID :</b> ${service_id}<br><b>Instance ID :</b> ${instance_id}`,
          // };
          // await sgMail
          //   .send(msg)
          //   .then(() => {
          //     console.log("Email sent");
          //   })
          //   .catch((error) => {
          //     console.error("Error while sending email : ", error);
          //   });

          return res.status(200).json({});
          // utils.writeJson(res, response);
        })
        .catch(function (response) {
          return utils.writeJson(res, response);
        })
        .catch(function (response) {
          return utils.writeJson(res, response);
        });
    }
  };

module.exports.serviceInstanceGetUsingGET = function serviceInstanceGetUsingGET(
  req,
  res,
  next,
  xBrokerAPIVersion,
  instance_id,
  xBrokerAPIOriginatingIdentity,
  service_id,
  plan_id
) {
  let authenticated = lib.authenticate(req, res, next);
  if (authenticated) {
    ServiceInstances.serviceInstanceGetUsingGET(
      xBrokerAPIVersion,
      instance_id,
      xBrokerAPIOriginatingIdentity,
      service_id,
      plan_id
    )
      .then(function (response) {
        return utils.writeJson(res, response);
      })
      .catch(function (response) {
        return utils.writeJson(res, response);
      });
  }
};

module.exports.serviceInstanceLastOperationGetUsingGET =
  function serviceInstanceLastOperationGetUsingGET(
    req,
    res,
    next,
    xBrokerAPIVersion,
    instance_id,
    service_id,
    plan_id,
    operation
  ) {
    let authenticated = lib.authenticate(req, res, next);
    if (authenticated) {
      ServiceInstances.serviceInstanceLastOperationGetUsingGET(
        xBrokerAPIVersion,
        instance_id,
        service_id,
        plan_id,
        operation
      )
        .then(function (response) {
          return utils.writeJson(res, response);
        })
        .catch(function (response) {
          return utils.writeJson(res, response);
        });
    }
  };

module.exports.serviceInstanceProvisionUsingPUT =
  function serviceInstanceProvisionUsingPUT(
    req,
    res,
    next,
    body,
    accepts_incomplete,
    instance_id,
    xBrokerAPIVersion,
    xBrokerAPIOriginatingIdentity
  ) {
    let authenticated = lib.authenticate(req, res, next);
    if (authenticated) {
      ServiceInstances.serviceInstanceProvisionUsingPUT(
        body,
        accepts_incomplete,
        instance_id,
        xBrokerAPIVersion,
        xBrokerAPIOriginatingIdentity
      )
        .then(async (response) => {
          const current_epoch = Date.now();

          await client.connect();

          var dbo = client.db("mydb");
          var myobj = {
            account_id: body.context.account_id,
            instance_id: instance_id,
            service_id: body.service_id,
            plan_id: body.plan_id,
            // ip_address: body.parameters.ipAddress || "",
            // email: body.parameters.email,
            // name: body.parameters.name,
            instance_name: body.context.name,
            created_at: current_epoch,
            metered: 0,
            activated: true,
            permenentClosed: false,
          };
          console.log("Object : ", myobj);
          try {
            await dbo.collection("users").insertOne(myobj);
            console.log("Data stored");
          } catch (e) {
            console.log("Error while storing data : ", e);
          }

          // send mail
          // const msg = {
          //   to: process.env.MAIL_TO,
          //   from: process.env.MAIL_FROM,
          //   subject: "Provision Request",
          //   html: `<b>Plan ID :</b> ${myobj.plan_id}<br>
          //           <b>Service ID :</b> ${myobj.service_id}<br>
          //           <b>Instance ID :</b> ${myobj.instance_id}<br>
          //           <b>Account ID :</b> ${myobj.account_id}<br>
          //           <b>Instance Name :</b> ${body.context.name}<br>
          //           <b>Emails :</b> ${myobj.email}<br>
          //           <b>IPs :</b> ${myobj.ip_address}<br>
          //           <b>Names :</b> ${myobj.name}<br>`,
          // };
          // await sgMail
          //   .send(msg)
          //   .then(() => {
          //     console.log("Email sent");
          //   })
          //   .catch((error) => {
          //     console.error("Error while sending mail : ", error);
          //   });

          return res.status(201).json({
            dashboard_url: process.env.DASHBOARD_URL,
          });

          // utils.writeJson(res, response);
        })
        .catch(function (response) {
          return utils.writeJson(res, response);
        });
    }
  };

module.exports.serviceInstanceUpdateUsingPATCH =
  function serviceInstanceUpdateUsingPATCH(
    req,
    res,
    next,
    body,
    accepts_incomplete,
    instance_id,
    xBrokerAPIVersion,
    xBrokerAPIOriginatingIdentity
  ) {
    let authenticated = lib.authenticate(req, res, next);
    console.log("Update call");
    if (authenticated) {
      ServiceInstances.serviceInstanceUpdateUsingPATCH(
        body,
        accepts_incomplete,
        instance_id,
        xBrokerAPIVersion,
        xBrokerAPIOriginatingIdentity
      )
        .then(async (response) => {
          console.log("Response inside then", response);
          await client.connect();
          const dbo = client.db("mydb");

          var updated_fields = {
            plan_id: body.plan_id,
          };
          const filter = { instance_id: instance_id };
          const updateOperation = {
            $set: updated_fields,
          };

          try {
            await dbo.collection("users").updateOne(filter, updateOperation);
          } catch (err) {
            console.log("Error while updating databse : ", err);
          }

          //send mail
          // const msg = {
          //   to: process.env.MAIL_TO,
          //   from: process.env.MAIL_FROM,
          //   subject: "Update Instance Plan Request",
          //   html: `<b>New Plan ID :</b> ${body.plan_id}<br><b>Service ID :</b> ${service_id}<br><b>Instance ID :</b> ${instance_id}`,
          // };
          // await sgMail
          //   .send(msg)
          //   .then(() => {
          //     console.log("Email sent");
          //   })
          //   .catch((error) => {
          //     console.error("Error while sending email : ", error);
          //   });
          return res.status(200).json({});
          // utils.writeJson(res, response);
        })
        .catch(function (response) {
          return utils.writeJson(res, response);
        });
    }
  };
