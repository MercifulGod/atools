#!/bin/bash
# https://www.cnblogs.com/zipxzf/articles/14638272.html



# yum 换源
mkdir -p /etc/yum.repo.d/
cd /etc/yum.repo.d/
# mkdir repos.bak
# mv CentOS-* ./repos.bak/
wget -O /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
yum clean all
# 也可以是 yum makecache fast ，更快一些
yum makecache
yum -y update


yum -y install net-tools telnet vim wget epel-release mysql-devel
yum -y install python3 python3-devel


# mysqlclient
yum -y install mariadb-devel gcc
pip3 install --upgrade pip


mkdir -p /etc/supervisor/conf.d
cp supervisord.conf /etc/supervisor/











# apt换源
# cp /etc/apt/sources.list /etc/apt/sources.list.bak
# echo "">sources.list
# echo "deb http://mirrors.163.com/ubuntu/ artful main restricted universe multiverse">>sources.list
# echo "deb http://mirrors.163.com/ubuntu/ artful-security main restricted universe multiverse">>sources.list
# echo "deb http://mirrors.163.com/ubuntu/ artful-updates main restricted universe multiverse">>sources.list
# echo "deb http://mirrors.163.com/ubuntu/ artful-proposed main restricted universe multiverse">>sources.list
# echo "deb http://mirrors.163.com/ubuntu/ artful-backports main restricted universe multiverse">>sources.list
# echo "deb-src http://mirrors.163.com/ubuntu/ artful main restricted universe multiverse">>sources.list
# echo "deb-src http://mirrors.163.com/ubuntu/ artful-security main restricted universe multiverse">>sources.list
# echo "deb-src http://mirrors.163.com/ubuntu/ artful-updates main restricted universe multiverse">>sources.list
# echo "deb-src http://mirrors.163.com/ubuntu/ artful-proposed main restricted universe multiverse">>sources.list
# echo "deb-src http://mirrors.163.com/ubuntu/ artful-backports main restricted universe multiverse">>sources.list




# Yum 换源
# 替换wget -O /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
# cat << EOF >/etc/yum.repo.d/CentOS-Base-ali.repo
# [base]
# name=CentOS-$releasever - Base - mirrors.aliyun.com
# failovermethod=priority
# baseurl=http://mirrors.aliyun.com/centos/$releasever/os/$basearch/
# gpgcheck=1
# gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
#
# #released updates
# [updates]
# name=CentOS-$releasever - Updates - mirrors.aliyun.com
# failovermethod=priority
# baseurl=http://mirrors.aliyun.com/centos/$releasever/updates/$basearch/
# gpgcheck=1
# gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
#
# #additional packages that may be useful
# [extras]
# name=CentOS-$releasever - Extras - mirrors.aliyun.com
# failovermethod=priority
# baseurl=http://mirrors.aliyun.com/centos/$releasever/extras/$basearch/
# gpgcheck=1
# gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
#
# #additional packages that extend functionality of existing packages
# [centosplus]
# name=CentOS-$releasever - Plus - mirrors.aliyun.com
# failovermethod=priority
# baseurl=http://mirrors.aliyun.com/centos/$releasever/centosplus/$basearch/
# gpgcheck=1
# enabled=0
# gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
#
# #contrib - packages by Centos Users
# [contrib]
# name=CentOS-$releasever - Contrib - mirrors.aliyun.com
# failovermethod=priority
# baseurl=http://mirrors.aliyun.com/centos/$releasever/contrib/$basearch/
# gpgcheck=1
# enabled=0
# gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
# EOF